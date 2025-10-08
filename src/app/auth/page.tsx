import { Tabs } from "radix-ui";
import { Login } from "@/app/auth/Login";
import { Register } from "@/app/auth/Register";

export default async function Page() {
  return (
    <main className={"flex-1 bg-[#EBF4FF]"}>
      <header className="flex items-center justify-between bg-[#007ACC] px-8 py-3 text-white shadow-md">
          <div className="flex items-center space-x-2">
              <div className="bg-white/20 rounded p-1">
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              </div>
              <span className="text-lg font-semibold">СтаффТехнолоджи</span>
          </div>

          <div className="space-x-2">
              <button className="rounded-md bg-[#E5F0FF] px-4 py-1 text-sm font-medium text-[#005FA3] hover:bg-[#D4E8FF]">
                  Регистрация
              </button>
              <button className="rounded-md bg-[#0066CC] px-4 py-1 text-sm font-medium text-white hover:bg-[#0055AA]">
                  Вход
              </button>
          </div>
      </header>
      <section className={"mx-auto my-10 w-[600px] rounded-lg bg-white p-6"}>
        <h1 className={"text-xl font-bold"}>Войдите или зарегистрируйтесь</h1>
        <Tabs.Root className={"mt-4"} defaultValue={"login"}>
          <Tabs.List className={"flex rounded-lg bg-gray-200 p-1"}>
            <Tabs.Trigger
              className={
                "h-9 w-full rounded-lg text-sm text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-500"
              }
              value={"login"}
            >
              Вход
            </Tabs.Trigger>
            <Tabs.Trigger
              className={
                "h-9 w-full rounded-lg text-sm text-gray-600 data-[state=active]:bg-white data-[state=active]:text-blue-500"
              }
              value={"register"}
            >
              Регистрация
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value={"login"}>
            <Login />
          </Tabs.Content>
          <Tabs.Content value={"register"}>
            <Register />
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </main>
  );
}
