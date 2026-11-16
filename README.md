# InstrumentTHAT

The owner console/receiver for choosing measuring instruments and retaining their actual measurement provenance. Engines remain with their existing owners.

## Current executable source

`node scripts/instruments.mjs catalog` lists all **54 source identifier strings** from Media Resolver's existing census, preserving overlapping families. `validate` checks closure and owner bindings. **19 existing rack readers** have an executable selected-reading port;35 other identifier strings are honestly unbound, not fake independent instruments.

`invokeSelected(request,{admit,runOwner})` in `lib/receiver.mjs` freezes the original, selection and source hash before asynchronous admission. The registered receiving host must provide its actual admission function and measurement owner. Missing admission refuses. Caller JSON cannot authorize itself. Private operations require their existing operation-specific two-step confirmation; this receiver does not grant permission or retrieve media.

`localMediaResolver(installedRoot)` creates a deployment-configured fixed CLI adapter to the exact accepted clean Media Resolver revision. Source status is checked before and after measurement; no caller path, command, URL, model or extra download is accepted. Measurement refusal/unavailable, unknown readings and the actual promotion gate remain intact.

## Check

```
npm test
npm run check
INSTRUMENTTHAT_TEST_MR_ROOT=/absolute/accepted/clean/media-resolver npm test
```

The third check exercises the real owner CLI on a nonprivate teaching sentence. It requires the pinned MR checkout and its existing Python dependencies. Tests without that configured owner explicitly skip this integration witness.

## Delivery boundary

This repository began as a seed. The registry and receiver are now executable source; they do not constitute registered ACT V5 Door installation or independent commissioning. The console must receive the existing ACT V5 exact cohort and Family/Nephew Door registration, not create a second shell. SaidTHAT is the Studio receiving host; Automata/RuleTHAT retain execution/admission authority. No standalone web server or unauthenticated private-transcript API is introduced here.

See [receiver contract](docs/receiver.md) for the executable boundary and remaining migration work. The earlier GitMore Heatmap reference remains historical: `act-v4/cassettes/gitmore-heatmap.md` (`CCK-CASSETTE-GITMORE-HEATMAP-0001`).
