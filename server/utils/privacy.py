def pseudonymize(name: str) -> str:
  return f"anon-{abs(hash(name)) % 10000}"

