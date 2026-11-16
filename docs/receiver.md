# InstrumentTHAT receiver v1

Function comes first: choose existing named readings, admit the exact operation through the actual receiving owner, then return unchanged measurements with source/selection readback. This composition layer never reproduces measurement code.

## Input and invocation

The input is the existing `media-resolver.selected-instrument-reading/v1`, not a competing transcript format. Required fields are schema,32hex request_id, exact transcript<=64KiB, its raw SHA256, and nonempty unique explicit instrument IDs. Optional fixed media record accepts only the original owner's three declared MIME types,<=8MiB, canonical base64, length and SHA; Media Resolver independently validates it before decoding. Requests may not add caller paths, URLs, commands, credentials or claimed permission fields.

`invokeSelected` invokes the trusted host `admit` callback with a frozen binding: request_id, request_sha256, transcript_sha256, selected IDs and optional media_sha256. It must consult the actual owner authorization/consent record. Only true proceeds; there is no default allow and no HTTP route. The runner receives a private snapshot, not a mutable caller reference. The receipt binds the exact request hash and accepted measurement-owner revision and retains the original owner result. It refuses changed owner identity, request, raw source, media hash or selections.

A retained unavailable result stays unavailable. Unknown values are never converted to zero or verdicts. Promotion remains false without the measurement owner's required representative gold-corpus validation. This receiver does not identify emotions, health, sincerity or speaker identity.

## Local owner adapter

`localMediaResolver` takes the root from trusted installation configuration, never request JSON. It requires accepted Media Resolver d748d88b8a4080b0be1be937f3b8e3c095c9f95b with no changed/untracked files before and after execution. It invokes only the fixed CLI with fixed argv, bounded output and timeout, no shell. Python/FFmpeg dependencies remain those of the measurement owner. A runner timeout can leave a restricted MR temporary artifact; preserve the uncertain operation and inspect its exact request-bound artifact before intentional recovery. Never automatically replay an admitted invocation.

The host must retain operation state and the admission receipt before calling this function, and separately verify its owner's result. An invocation callback is not an identity token or an independently commissioned service.

## Census and remaining ports

The54 rows preserve exact IDs/families from the existing MR census. Nineteen use the existing rack reader. The remaining35 need adapters to their actual source owners: teaching projections, meter views, Python family projections or related ReadyPlay catalogue instruments. An alias/teaching view must not become a fabricated second engine. Timing readers additionally require actual owner-supplied timed words; evidence readers require real evidence. The media-byte port measures recording acoustics without inventing these inputs.

## Measured source checks

Receiver/refusal tests cover catalog closure, missing/denied admission, malformed requests, unbound IDs, retained snapshots, wrong source/selection readback and changed installation. A configured local integration exercises the accepted MR CLI with a nonprivate teaching sentence and verifies a measured lexical-density result and false promotion gate. This is actual CLI proof, distinct from active Studio/ACT Door proof.

## Actual next delivery

Receive this owner from SaidTHAT's existing admitted operation; package the pinned MR dependency through existing owner deployment. Project the catalog into the existing ACT V5 native cassette with CCKTHAT cards, fields, padding, Center Focus, live rails and same-work Return. Register InstrumentTHAT's own Door through Family/Nephew and prove it there. No Door or registration receipt is asserted by this source release.
