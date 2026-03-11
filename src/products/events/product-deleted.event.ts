export class ProductDeletedEvent {
  constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly req?: Request,
  ) {}
}
