import { NextResponse } from "next/server";
import { getDatabaseUrl, isProductionWithoutDatabase } from "@/lib/store-types";
import mysql from "mysql2/promise";

export async function GET() {
  if (isProductionWithoutDatabase()) {
    return NextResponse.json({
      ok: false,
      error: "DATABASE_URL ali DATABASE_HOST/USER/PASSWORD/NAME ni nastavljen na Vercelu.",
    });
  }

  const url = getDatabaseUrl();
  if (!url) {
    return NextResponse.json({
      ok: false,
      error: "Baza ni konfigurirana.",
    });
  }

  // Ne izpostavljaj gesla — samo katera polja so nastavljena
  const usingUrl = Boolean(process.env.DATABASE_URL);
  const host = process.env.DATABASE_HOST || "(iz DATABASE_URL)";
  const user = process.env.DATABASE_USER || "(iz DATABASE_URL)";
  const database = process.env.DATABASE_NAME || "(iz DATABASE_URL)";

  try {
    const conn = await mysql.createConnection({
      uri: url,
      connectTimeout: 10_000,
    });
    await conn.query("SELECT 1");
    await conn.end();

    return NextResponse.json({
      ok: true,
      message: "Povezava z MySQL deluje.",
      config: { usingUrl, host, user, database },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    let hint = "Preveri uporabnika, geslo in ime baze v Vercel Environment Variables.";
    if (message.includes("Access denied")) {
      hint =
        "MySQL zavrne prijavo. V cPanel: Change Password, Add User To Database (ALL PRIVILEGES), uporabi ločena polja DATABASE_HOST/USER/PASSWORD/NAME namesto DATABASE_URL.";
    } else if (message.includes("ENOTFOUND") || message.includes("ETIMEDOUT")) {
      hint =
        "Strežnik ni dosegljiv. HOST mora biti Shared IP iz cPanela (ne localhost). Preveri Remote MySQL (%).";
    } else if (message.includes("ECONNREFUSED")) {
      hint =
        "Povezava zavrnjena. Neoserv morda ne dovoli oddaljenega MySQL — preveri Remote MySQL ali kontaktiraj Neoserv podporo.";
    }

    return NextResponse.json({
      ok: false,
      error: message,
      hint,
      config: { usingUrl, host, user, database },
    });
  }
}
