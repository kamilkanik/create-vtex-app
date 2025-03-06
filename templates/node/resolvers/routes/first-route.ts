export async function firstRoute(ctx: Context, next: () => Promise<void>) {
    ctx.response.status = 200;
    ctx.response.body = "This is my first route!"

    return next();
}
