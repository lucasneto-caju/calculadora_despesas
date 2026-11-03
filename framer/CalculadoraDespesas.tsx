// Code Component do Framer para a Calculadora do Custo Invisível das Despesas.
//
// Como usar: no Framer, Assets → Code → "+" → New Component, apague o conteúdo,
// cole este arquivo e salve. Depois arraste "CalculadoraDespesas" para a página,
// deixe a largura como Fill (ou fixa) e a altura como Fit Content, e preencha a URL.
//
// O que ele faz:
//  - ajusta a altura do quadro ao conteúdo de cada tela (sem barra de rolagem interna);
//  - ao trocar de tela, rola a página até o topo da calculadora;
//  - repassa as UTMs da URL da LP e o client id do GA (cookie _ga) para a calculadora.
//    Com este componente, o framer-snippet.html NÃO é necessário.

import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const UTM_KEY = "caju_calc_utms"

function lerUtms(): Record<string, string> {
    let utms: Record<string, string> = {}
    try {
        new URLSearchParams(window.location.search).forEach((v, k) => {
            if (/^utm_/i.test(k) && v) utms[k.toLowerCase()] = v
        })
        // Se a pessoa navegou dentro do site e a URL perdeu as UTMs, usa as da entrada.
        if (Object.keys(utms).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utms))
        else utms = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}")
    } catch (e) {}
    return utms
}

function lerGaClientId(): string {
    const m = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/)
    if (!m) return ""
    const p = decodeURIComponent(m[1]).split(".")
    return p.length >= 4 ? p.slice(-2).join(".") : ""
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CalculadoraDespesas(props) {
    const { url, alturaInicial, distanciaTopo } = props
    const ref = useRef<HTMLIFrameElement>(null)
    const [altura, setAltura] = useState<number>(alturaInicial)

    useEffect(() => {
        let origem = ""
        try {
            origem = new URL(url).origin
        } catch (e) {
            return
        }
        const utms = lerUtms()

        function onMessage(e: MessageEvent) {
            const iframe = ref.current
            if (!iframe || e.source !== iframe.contentWindow || e.origin !== origem) return
            const d = e.data || {}

            if (d.type === "caju-calc-height" && typeof d.height === "number" && d.height > 0) {
                setAltura(Math.ceil(d.height))
            }

            if (d.type === "caju-calc-ready") {
                iframe.contentWindow?.postMessage(
                    {
                        type: "caju-calc-context",
                        utms,
                        gaClientId: lerGaClientId(),
                        pageUrl: window.location.href,
                    },
                    origem
                )
            }

            // Só rola se o topo da calculadora estiver fora da tela (acima).
            if (d.type === "caju-calc-screen") {
                const topo = iframe.getBoundingClientRect().top
                if (topo < 0) {
                    window.scrollBy({ top: topo - distanciaTopo, behavior: "smooth" })
                }
            }
        }

        window.addEventListener("message", onMessage)
        return () => window.removeEventListener("message", onMessage)
    }, [url, distanciaTopo])

    if (!url) {
        return (
            <div style={{ padding: 24, background: "#2B2521", color: "#fff", fontFamily: "sans-serif", borderRadius: 12 }}>
                Preencha a URL da calculadora no painel à direita.
            </div>
        )
    }

    return (
        <iframe
            ref={ref}
            src={url}
            title="Calculadora do Custo Invisível das Despesas"
            loading="eager"
            style={{
                width: "100%",
                height: altura,
                border: 0,
                display: "block",
                background: "#2B2521",
                ...props.style,
            }}
        />
    )
}

CalculadoraDespesas.defaultProps = {
    url: "",
    alturaInicial: 720,
    distanciaTopo: 80,
}

addPropertyControls(CalculadoraDespesas, {
    url: {
        type: ControlType.String,
        title: "URL",
        placeholder: "https://calculadora-despesas.vercel.app",
    },
    alturaInicial: {
        type: ControlType.Number,
        title: "Altura inicial",
        defaultValue: 720,
        min: 300,
        max: 3000,
        unit: "px",
    },
    distanciaTopo: {
        type: ControlType.Number,
        title: "Folga do topo",
        defaultValue: 80,
        min: 0,
        max: 300,
        unit: "px",
        description: "Espaço deixado acima da calculadora ao rolar (ex.: altura do menu fixo).",
    },
})
