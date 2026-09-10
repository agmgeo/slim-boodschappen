import { Global, Module } from '@nestjs/common';
import { TtlCache } from './ttl-cache';

export const CACHE_INSTANCE = 'CACHE_INSTANCE';

@Global()
@Module({
  providers: [{ provide: CACHE_INSTANCE, useValue: new TtlCache() }],
  exports: [CACHE_INSTANCE],
})
export class CacheModule {}
