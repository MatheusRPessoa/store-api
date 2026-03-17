export class UserUpdatedEvent {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly req?: Request,
  ) {}
}
