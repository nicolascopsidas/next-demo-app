export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" flex flex-col items-center justify-center mb-16 h-full w-full ">
      {children}
    </div>
  );
}
