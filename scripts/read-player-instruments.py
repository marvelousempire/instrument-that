#!/usr/bin/env python3
"""Fixed adapter; imported measurement functions remain in their verified owner."""
import json,sys,typing,hashlib,datetime,tempfile
# Existing bytecode caches are not accepted source. This isolated process never writes them.
_bytecode=tempfile.TemporaryDirectory(prefix='instrument-that-bytecode-')
sys.pycache_prefix=_bytecode.name
sys.path.insert(0,sys.argv[1])
import player_market_desk
payload=json.load(sys.stdin)
result=player_market_desk.run(payload['source'])
fields={'form_heat':'form_heat','relative_form':'relative','session_tape':'tape','peak_from_peak':'peak','form_stack':'form_stack','vault_fill':'vault_fill'}
readings=[]
for instrument in payload['instruments']:
    value=result if instrument=='desk_receipt' else result['desk'][fields[instrument]]
    readings.append({'instrument':instrument,'basis':'measured-transform','original_reading':value})
print(json.dumps({'schema':'instrument-that.player-readings/v1','request_id':payload['request_id'],'source_sha256':payload['source_sha256'],'readings':readings},allow_nan=False))
