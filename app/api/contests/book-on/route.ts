import { getAdminSupabase, jsonError } from "@/lib/supabase-server";

const BUCKET = "bookon-logo-contest";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEADLINE = new Date("2026-07-25T14:59:59.999Z");
const EMAIL_PATTERN = /^s\d{5}@gsm\.hs\.kr$/;
const EMAIL_FORMAT_ERROR = "학교 이메일을 s25038@gsm.hs.kr 형식으로 입력해주세요.";
const FILE_PATH_PATTERN = /^submissions\/[0-9a-f-]{36}\.png$/i;

export async function GET(request: Request) {
  const client = getAdminSupabase();
  if (!client) return jsonError("제출 서버가 준비되지 않았습니다.", 503);

  const email = normalizeEmail(new URL(request.url).searchParams.get("email"));
  if (!email || !EMAIL_PATTERN.test(email)) return jsonError(EMAIL_FORMAT_ERROR);

  const { data, error } = await client
    .from("logo_contest_submissions")
    .select("id")
    .eq("email_normalized", email)
    .maybeSingle();

  if (error) return jsonError("이메일 중복 여부를 확인하지 못했습니다.", 500);
  return Response.json({ exists: Boolean(data) });
}

export async function POST(request: Request) {
  const client = getAdminSupabase();
  if (!client) return jsonError("제출 서버가 준비되지 않았습니다.", 503);

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return jsonError("제출 내용을 확인해주세요.");
  if (new Date() > DEADLINE) return jsonError("공모전 접수가 마감되었습니다.", 410);

  const action = clean(body.action, 20);
  if (action === "prepare") {
    const email = normalizeEmail(body.email);
    const fileName = clean(body.fileName, 180);
    const fileSize = numberValue(body.fileSize);
    if (!email || !EMAIL_PATTERN.test(email)) return jsonError(EMAIL_FORMAT_ERROR);
    if (!fileName.toLowerCase().endsWith(".png")) return jsonError("PNG 파일만 업로드할 수 있습니다.");
    if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) return jsonError("파일 크기는 최대 10MB까지 가능합니다.");

    const { data: duplicate, error: duplicateError } = await client
      .from("logo_contest_submissions")
      .select("id")
      .eq("email_normalized", email)
      .maybeSingle();
    if (duplicateError) return jsonError("이메일 중복 여부를 확인하지 못했습니다.", 500);
    if (duplicate) return jsonError("이미 제출된 이메일입니다.", 409);

    const path = `submissions/${crypto.randomUUID()}.png`;
    const { data, error } = await client.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data?.token) return jsonError("파일 업로드를 준비하지 못했습니다.", 500);
    return Response.json({ path, token: data.token });
  }

  if (action === "complete") {
    const name = clean(body.name, 80);
    const grade = numberValue(body.grade);
    const classNumber = numberValue(body.classNumber);
    const studentNumber = numberValue(body.studentNumber);
    const email = normalizeEmail(body.email);
    const fileName = clean(body.fileName, 180);
    const fileSize = numberValue(body.fileSize);
    const filePath = clean(body.filePath, 160);
    const creationMethod = clean(body.creationMethod, 12);

    if (!name) return jsonError("이름을 정확히 입력해주세요.");
    if (!email || !EMAIL_PATTERN.test(email)) return jsonError(EMAIL_FORMAT_ERROR);
    if (grade < 1 || grade > 3 || classNumber < 1 || classNumber > 20 || studentNumber < 1 || studentNumber > 50) return jsonError("학년, 반, 번호를 정확히 입력해주세요.");
    if (!FILE_PATH_PATTERN.test(filePath) || !fileName.toLowerCase().endsWith(".png") || fileSize <= 0 || fileSize > MAX_FILE_SIZE) return jsonError("업로드한 PNG 파일을 확인해주세요.");
    if (!['direct', 'ai'].includes(creationMethod)) return jsonError("제작 방법을 선택해주세요.");

    const { data: uploaded, error: downloadError } = await client.storage.from(BUCKET).download(filePath);
    if (downloadError || !uploaded) return jsonError("업로드한 파일을 찾지 못했습니다.", 400);
    const bytes = new Uint8Array(await uploaded.arrayBuffer());
    if (bytes.byteLength !== fileSize || bytes.byteLength > MAX_FILE_SIZE || !isPng(bytes)) {
      await client.storage.from(BUCKET).remove([filePath]);
      return jsonError("올바른 PNG 파일이 아닙니다.");
    }

    const { error } = await client.from("logo_contest_submissions").insert({
      name,
      grade,
      class_number: classNumber,
      student_number: studentNumber,
      school_email: email,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      creation_method: creationMethod,
      status: "submitted",
    });
    if (error) {
      await client.storage.from(BUCKET).remove([filePath]);
      if (error.code === "23505") return jsonError("이미 제출된 이메일입니다.", 409);
      return jsonError("제출 내용을 저장하지 못했습니다.", 500);
    }
    return Response.json({ ok: true });
  }

  return jsonError("지원하지 않는 제출 작업입니다.");
}

function clean(value: unknown, length: number) {
  return String(value ?? "").trim().slice(0, length);
}

function normalizeEmail(value: unknown) {
  return clean(value, 254).toLowerCase();
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : 0;
}

function isPng(bytes: Uint8Array) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
}
