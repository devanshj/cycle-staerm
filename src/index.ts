import { Terminal, TerminalState, KeypressMiddleware, KeypressData } from "staerm";
import xs, { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"

export type StreamSinks = {
    state$: Stream<TerminalState>,
    keypressMiddleware$?: Stream<KeypressMiddleware>
}

export type StreamSources = {
    keypress$: Stream<KeypressData>
}

export const makeStaermDriver = (terminal: Terminal): Driver<StreamSinks, StreamSources> =>
    ({ state$, keypressMiddleware$ }: StreamSinks): StreamSources => {
        state$.addListener({ next: terminal.state.set });

        if (keypressMiddleware$) {
            keypressMiddleware$.addListener({ next: terminal.io.keypress.middleware.set });
        }

        return {
            keypress$: adapt(xs.create({
                start: listener => terminal.io.keypress.listen(
                    bindMethod(listener, "next")
                ),
                stop: () => {}
            }))
        }
    }

type FunctionKeyof<T, P extends keyof T = keyof T> = {
    [K in P]: T[K] extends Function ? K : never;
}[P];

const bindMethod =
    <T extends object>(stuff: T, method: FunctionKeyof<T>) =>
        (stuff[method] as unknown as Function).bind(stuff)