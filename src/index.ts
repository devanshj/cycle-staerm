import { Terminal, TerminalState, KeypressMiddleware, KeypressData } from "staerm";
import xs, { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"

export type StreamSink = Stream<{
    state: TerminalState,
    keypressMiddleware?: KeypressMiddleware
}>

export type StreamSource = {
	keypress$: Stream<KeypressData>,
	state$: Stream<TerminalState>
}

export const makeStaermDriver = (terminal: Terminal): Driver<StreamSink, StreamSource> =>
    (staermSink$: StreamSink): StreamSource => {
        staermSink$.addListener({ 
			next: ({ state, keypressMiddleware }) => {
				terminal.state.set(state)
				if (keypressMiddleware) {
					terminal.io.keypress.middleware.set(keypressMiddleware)
				}
			}
		});

        return {
            keypress$: adapt(xs.create({
                start: listener => terminal.io.keypress.listen(
                    bindMethod(listener, "next")
                ),
                stop: () => {}
			})),
			state$: adapt(xs.create({
                start: listener => terminal.state.listen(
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