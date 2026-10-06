#!/usr/bin/env python3
"""Record actual local UI interactions. Never use against a hosted site or real account.

Requires Playwright Python and its Chromium browser. Output is a continuous
browser recording plus timed Spanish captions and a sanitized result receipt.
No profile import, API writes, fixture injection, storage reset or time speedup.
"""

import argparse
import hashlib
import json
import re
import subprocess
import time
from pathlib import Path
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright, expect


def stamp(seconds):
    value = round(seconds * 1000)
    return f"{value // 3600000:02}:{value // 60000 % 60:02}:{value // 1000 % 60:02},{value % 1000:03}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:5357")
    parser.add_argument("--output", type=Path, default=Path("work/interactive-demo"))
    parser.add_argument("--hold-seconds", type=float, default=4.5)
    args = parser.parse_args()
    origin = urlsplit(args.base_url)
    if (origin.scheme != "http" or origin.hostname not in ("localhost", "127.0.0.1", "::1")
            or origin.username or origin.password or origin.query or origin.fragment or origin.path not in ("", "/")):
        parser.error("Only a plain HTTP loopback origin is permitted.")
    if not 0 <= args.hold_seconds <= 8:
        parser.error("--hold-seconds must be between 0 and 8.")
    out = args.output.resolve()
    out.mkdir(parents=True, exist_ok=True)
    if (out / "receipt.json").exists():
        parser.error("Choose a fresh output directory; previous evidence is preserved.")
    repo = Path(__file__).resolve().parents[1]
    report = {
        "format": "Continuous automated browser interaction, local fictional sandbox",
        "source_base_sha": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=repo, text=True).strip(),
        "app_page_sha256": hashlib.sha256((repo / "app/page.tsx").read_bytes()).hexdigest(),
        "created_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "hosted_acceptance": False, "real_account_isolation": False,
        "human_operator": False, "financial_resolutions": 0,
        "narration": "Spanish timed captions, no voice track",
        "video_edits": "None in raw WebM; any MP4 is a single-input transcode without cuts or speedup",
        "steps": [], "checks": [], "status": "running",
    }
    started = time.monotonic()
    captions = []
    video = None

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, slow_mo=140)
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000},
            record_video_dir=str(out / "raw"),
            record_video_size={"width": 1440, "height": 1000},
            locale="es-EC", timezone_id="America/Guayaquil",
        )
        # Isolate this synthetic recording from external sites and credentials.
        context.route("**/*", lambda route: route.continue_() if urlsplit(route.request.url).hostname == origin.hostname else route.abort())
        started = time.monotonic()
        page = context.new_page()
        video = page.video
        page.set_default_timeout(12000)

        def cue(text, hold=None):
            at = round(time.monotonic() - started, 3)
            captions.append({"start": at, "text": text})
            report["steps"].append({"at_seconds": at, "caption": text})
            print(text.replace("\n", " / "), flush=True)
            page.wait_for_timeout(1000 * (args.hold_seconds if hold is None else hold))

        def check(name, condition):
            if not condition:
                raise AssertionError(name)
            report["checks"].append({"name": name, "passed": True})

        def click(locator):
            locator.scroll_into_view_if_needed()
            box = locator.bounding_box()
            if box:
                page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=8)
            locator.click()

        def button(name):
            return page.get_by_role("button", name=name, exact=True)

        def response_after(method, path, action):
            with page.expect_response(lambda r: urlsplit(r.url).path == path and r.request.method == method) as response:
                action()
            result = response.value
            return result.status, result.json()

        try:
            page.goto(args.base_url, wait_until="networkidle")
            cue("Reclama: recepción de disputas ES/PT.\nGrabación continua automatizada, local y con datos ficticios.")
            click(page.get_by_role("link", name="Entrar con ChatGPT", exact=True))
            click(button("Iniciar sandbox"))
            expect(button("Nuevo recorrido")).to_be_visible()
            cue("Inicio simulado de desarrollo.\nEsto no acredita el login de la demo alojada.")
            click(button("Nuevo recorrido"))
            click(button("Crear recorrido"))
            expect(page.get_by_role("dialog")).to_have_count(0)
            click(button("Guía de 3 minutos"))
            text = page.get_by_role("textbox", name="Mensaje al asistente", exact=True)
            text.fill("No reconozco una compra de 84,90 USD en Luna Digital.")
            status, advisory = response_after("POST", "/api/message", lambda: click(button("Enviar mensaje")))
            check("ambiguity returns two candidates without selecting", status == 200 and len(advisory["assistance"]["candidates"]) == 2 and advisory["assistance"]["selectedTransactionId"] is None)
            expect(page.locator(".candidate-card")).to_have_count(2)
            page.locator(".candidate-card").first.scroll_into_view_if_needed()
            cue("Dos compras parecidas no prueban duplicidad.\nLa app pide elegir: no registra un caso automáticamente.")
            click(page.locator(".candidate-card").filter(has_text="02:22").first)
            click(page.get_by_role("combobox", name="Confirma el motivo", exact=True))
            click(page.get_by_role("option", name="Cargo no reconocido", exact=True))
            statement = "No reconozco la compra de Luna Digital por 84,90 USD del 16 de junio a las 14:22. Solicito revisión humana."
            page.get_by_role("textbox", name="Tu declaración", exact=True).fill(statement)
            cue("Elegimos la compra exacta y el motivo.\nEl relato no es un hecho verificado.")
            click(button("Revisar antes de enviar"))
            expect(button("Confirmar y registrar")).to_be_disabled()
            check("consent starts unchecked", not page.get_by_role("checkbox").is_checked())
            cue("Hechos, relato y preguntas pendientes están separados.\nEl envío exige consentimiento explícito.")
            page.get_by_role("checkbox").check()
            status, saved = response_after("POST", "/api/cases", lambda: click(button("Confirmar y registrar")))
            case_a = saved["case"]
            check("ES intake persisted", status == 201 and case_a["kind"] == "dispute_intake" and case_a["statement"] == statement)
            report["case_es"] = {k: case_a[k] for k in ("id", "kind", "status", "version")}
            cue("Expediente recibido para revisión humana.\nNo hay decisión de fraude ni reembolso.")
            page.reload(wait_until="networkidle")
            click(page.get_by_role("tab", name=re.compile(r"^Mesa de revisión(?: \d+)?$")))
            click(page.locator(".case-row").filter(has_text=case_a["id"]))
            expect(page.get_by_role("dialog")).to_contain_text(statement)
            check("ES case survives local browser reload", case_a["id"] in page.get_by_role("dialog").inner_text())
            cue("Recargo el navegador y recupero el mismo expediente.\nPersistencia local observada, no aceptación alojada.")
            click(page.get_by_role("dialog").get_by_role("button", name="Cerrar", exact=True))
            click(button("Entrar como revisor demo"))
            click(page.locator(".case-row").filter(has_text=case_a["id"]))
            note = "Pendiente contrastar la autorización y solicitar evidencia al comercio. No se ha determinado fraude ni reembolso."
            page.get_by_role("textbox", name="Nota para el siguiente revisor", exact=True).fill(note)
            status, updated = response_after("PATCH", "/api/cases/" + case_a["id"], lambda: click(button("Marcar en revisión")))
            check("review advances case version", status == 200 and updated["case"]["version"] == 2 and updated["case"]["status"] == "in_review")
            expect(page.get_by_role("dialog")).to_contain_text("Revisión actualizada")
            cue("El revisor simulado añade una nota y el caso pasa a versión 2.\nLa auditoría conserva recepción y actualización.")
            click(page.get_by_role("dialog").get_by_role("button", name="Cerrar", exact=True))
            click(button("Volver a cliente"))
            click(page.get_by_role("tab", name="Atención", exact=True))
            click(page.get_by_role("combobox", name="Identidad de demostración", exact=True))
            click(page.get_by_role("option", name="Lucas · PT", exact=True))
            expect(button("PT")).to_be_visible()
            click(button("Novo percurso"))
            click(button("Criar percurso"))
            expect(page.get_by_role("dialog")).to_have_count(0)
            click(button("Guia de 3 minutos"))
            page.get_by_role("textbox", name="Mensagem ao assistente", exact=True).fill("Não reconheço a compra revertida da Oficina Prisma por 63.000,00 ARS.")
            status, advisory_pt = response_after("POST", "/api/message", lambda: click(button("Enviar mensagem")))
            check("Portuguese message processed", status == 200 and len(advisory_pt["assistance"]["candidates"]) == 1)
            click(page.locator(".candidate-card").filter(has_text="Oficina Prisma"))
            click(page.get_by_role("combobox", name="Confirme o motivo", exact=True))
            click(page.get_by_role("option", name="Compra não reconhecida", exact=True))
            statement_pt = "Não reconheço esta compra revertida e solicito análise humana."
            page.get_by_role("textbox", name="Seu relato", exact=True).fill(statement_pt)
            cue("Em português: a compra está revertida.\nO sistema prepara suporte, sem prometer reembolso.")
            click(button("Simular perda de resposta"))
            click(button("Revisar antes de enviar"))
            expect(page.get_by_role("dialog")).to_contain_text("solicitação de suporte")
            page.get_by_role("checkbox").check()
            status, fault = response_after("POST", "/api/cases", lambda: click(button("Confirmar e registrar")))
            check("explicit simulated response loss", status == 503 and fault.get("error") == "SIMULATED_TIMEOUT")
            cue("Fallo simulado: caso guardado, respuesta perdida.\nReintentamos la misma solicitud.")
            status, recovered = response_after("POST", "/api/cases", lambda: click(button("Repetir a mesma solicitação")))
            case_b = recovered["case"]
            check("retry recovers persisted PT handoff", status == 200 and recovered.get("replayed") is True and case_b["kind"] == "support_handoff")
            report["case_pt"] = {k: case_b[k] for k in ("id", "kind", "status", "version")}
            expect(page.get_by_text("Resposta recuperada. Existe apenas um caso.", exact=True)).to_be_visible()
            cue("Resposta recuperada: um único expediente de suporte.\nEl retry recupera el caso existente; no crea otro.")
            page.reload(wait_until="networkidle")
            click(page.get_by_role("tab", name=re.compile(r"^Mesa de análise(?: \d+)?$")))
            expect(page.locator(".case-row")).to_have_count(1)
            click(page.locator(".case-row").filter(has_text=case_b["id"]))
            expect(page.get_by_role("dialog")).to_contain_text(statement_pt)
            expect(page.get_by_role("dialog")).to_contain_text("Recebimento confirmado")
            check("PT readback after reload has one case and receipt", True)
            cue("Relectura y auditoría del handoff portugués tras recarga.\nLa revisión financiera sigue pendiente.")
            click(page.get_by_role("dialog").get_by_role("button", name="Fechar", exact=True))
            click(page.get_by_role("tab", name="Evidências", exact=True))
            page.get_by_text("Um modelo orientativo, sem validação independente", exact=True).scroll_into_view_if_needed()
            cue("El modelo sólo orienta y sigue congelado.\nSu experimento no es validación independiente.", hold=6)
            cue("Faltan login alojado y prueba de dos cuentas reales.\nSin resolución financiera; costo total desconocido.", hold=6)
            report["status"] = "passed"
        except Exception as error:
            report["status"] = "failed"
            report["failure"] = type(error).__name__ + ": " + str(error)[:1200]
            page.screenshot(path=str(out / "failure.png"))
            (out / "failure-aria.txt").write_text(page.locator("body").aria_snapshot())
            raise
        finally:
            report["interaction_wall_seconds"] = round(time.monotonic() - started, 3)
            if captions:
                lines = []
                for i, caption in enumerate(captions):
                    end = captions[i + 1]["start"] - 0.05 if i + 1 < len(captions) else report["interaction_wall_seconds"]
                    lines.append(f"{i+1}\n{stamp(caption['start'])} --> {stamp(end)}\n{caption['text']}\n")
                (out / "captions.srt").write_text("\n".join(lines))
            context.close()
            if video:
                report["raw_video_filename"] = Path(video.path()).name
            browser.close()
            (out / "receipt.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "checks": len(report["checks"]), "seconds": report["interaction_wall_seconds"]}))


if __name__ == "__main__":
    main()
