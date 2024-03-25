import type * as jose from 'jose'
import { JWTVerifyGetKey } from 'jose'

export type KeyPair = jose.GenerateKeyPairResult<
  jose.KeyLike & jose.JWK
>

export interface IJoseVerify {
  key: KeyPair,
  jwks: JWTVerifyGetKey,
}
