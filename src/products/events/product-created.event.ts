export class ProductCreatedEvent {
  constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly req?: Request,
  ) {}
}
