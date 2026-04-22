type PrismaLikeError = {
  code?: string;
};

export function getPrismaErrorCode(error: unknown) {
  return (error as PrismaLikeError | null | undefined)?.code ?? null;
}

export function isPrismaSchemaDriftError(error: unknown) {
  const code = getPrismaErrorCode(error);
  const message = error instanceof Error ? error.message : String(error ?? "");

  return (
    code === "P2021" ||
    code === "P2022" ||
    /does not exist|no such table|unknown column|missing column/i.test(message)
  );
}

export function formatPrismaSchemaDrift(scope: string, error: unknown) {
  const code = getPrismaErrorCode(error);
  const message = error instanceof Error ? error.message : String(error ?? "");
  return code ? `${scope}: ${code} ${message}` : `${scope}: ${message}`;
}
