import test from 'node:test';import assert from 'node:assert/strict';import {z} from 'zod';import {AppError} from '../src/domain/errors.js';
test('erros de domínio possuem status',()=>{const e=new AppError('Inválido',422);assert.equal(e.status,422)});
test('payload de comentário vazio é rejeitado',()=>{assert.equal(z.string().trim().min(1).safeParse('  ').success,false)});
test('posição negativa é rejeitada',()=>{assert.equal(z.number().int().min(0).safeParse(-1).success,false)});
