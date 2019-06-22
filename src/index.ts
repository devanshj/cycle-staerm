import { Terminal, TerminalState, KeypressData } from "staerm";
import xs, { Stream } from "xstream"
import { Driver } from "@cycle/run"
import { adapt } from "@cycle/run/lib/adapt"

export type StaermSink = Stream<TerminalState>;
export type StaermSource = {
	keypress$: Stream<KeypressData>
}

export const makeStaermDriver = (terminal: Terminal): Driver<StaermSink, StaermSource> =>
    (state$: StaermSink): StaermSource => {
        state$.addListener({ 
			next: terminal.state.set
		});

        return {
            keypress$: adapt(xs.create({
                start: listener => terminal.io.keypress.listen(
                    bindMethod(listener, "next")
                ),
                stop: () => {}
			}))
        }
    }

const bindMethod =
    <T extends object, P extends keyof T = keyof T>(
        stuff: T,
        method: {
            [K in P]:
                T[K] extends Function
                    ? K
                    : never;
        }[P]
    ) =>
        (stuff[method] as unknown as Function).bind(stuff)