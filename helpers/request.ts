export const handleSuccess = async (ctx: Context, data: any) => {
  ctx.response.body = {
    success: true,
    data,
  };
  ctx.response.status = 200;
};
