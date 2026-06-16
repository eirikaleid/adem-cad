import type { IOperation, OperationConstructor } from './IOperation'
import type { OcctAdapterBridge } from '../services/OcctAdapterBridge'

export type ModelingOperationType =
  | 'extrude'
  | 'revolve'
  | 'boolean-union'
  | 'boolean-subtract'
  | 'boolean-intersect'

export class OperationFactory {
  private static registry = new Map<ModelingOperationType, OperationConstructor>()

  static register(type: ModelingOperationType, ctor: OperationConstructor): void {
    OperationFactory.registry.set(type, ctor)
  }

  static create(type: ModelingOperationType, adapter: OcctAdapterBridge): IOperation {
    const Ctor = OperationFactory.registry.get(type)
    if (!Ctor) throw new Error(`Unknown operation type: ${type}`)
    return new Ctor(adapter)
  }

  static getRegistered(): ModelingOperationType[] {
    return Array.from(OperationFactory.registry.keys())
  }

  // Test ortamında registry'yi temizlemek için
  static clearForTesting(): void {
    OperationFactory.registry.clear()
  }
}
