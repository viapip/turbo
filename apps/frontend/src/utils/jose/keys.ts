// import { readFile } from 'node:fs/promises'

import { createLocalJWKSet, importJWK } from 'jose'

// import type { KeyPair } from './types'

export const keys1 = {
  "publicKey": {
    "kty": "EC",
    "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
    "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
    "crv": "P-256",
    "kid": "key1"
  },
  "privateKey": {
    "kty": "EC",
    "x": "D8qVLV7UckTvFFMB2dRumgO1hb-VctMkcdCfLWLaFvQ",
    "y": "pKHQOfL0K8W6FZipThjF9XYuXrciOQeQE4ei55vSXes",
    "crv": "P-256",
    "d": "CGUOSodDIy0tqTpgDxH0j4ReoMA9tzeMXUVmZ61G0Y0",
    "kid": "key1"
  }
}

const alg = 'ES256'
export const keys2 = {
  "publicKey": {
    "kty": "EC",
    "x": "8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ",
    "y": "EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I",
    "crv": "P-256",
    "kid": "key2"
  },
  "privateKey": {
    "kty": "EC",
    "x": "8a8o_RUGD1_piE5ouA9ZyHI-4FHIZEZgTO6bW5MORYQ",
    "y": "EVyoFgTSSyymg1pAStH42OpQezzOMM12kVCS6KHpm-I",
    "crv": "P-256",
    "d": "KUiphkKbdmzYT_wnn0LFdfGXI0EFgRTV2sZEI1XRH8g",
    "kid": "key2"
  }
}

export const keys1Private = await importJWK(keys1.privateKey)
export const keys2Private = await importJWK(keys2.privateKey)

export const jwks = createLocalJWKSet({
  keys: [
    keys1.publicKey,
    keys2.publicKey,
  ],
})
