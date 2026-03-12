export class UserDeletedEvent {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly req?: Request,
  ) {}
}
