import { Prisma, PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const usersData: Prisma.UserCreateInput = [
  {
    firstName: "Пользователь",
    lastName: "Пользователь",
    email: "user",
    phone: "+70000000000",
    role: "user",
    password: "123",
  },
  {
    firstName: "Админ",
    lastName: "Админ",
    email: "admin",
    phone: "+70000000001",
    role: "admin",
    password: "1234",
  },
];

const profilesData: Prisma.ProfileCreateInput[] = [
  {
    name: "Эконом",
    price: 3000,
  },
  {
    name: "Стандарт",
    price: 6000,
  },
  {
    name: "Премиум",
    price: 9000,
  },
];

const productsData: Prisma.ProductCreateInput[] = [
  {
    name: "Ручка оконная ClassicLine белая",
    description:
      "Простая и надёжная ручка для пластиковых окон. Корпус из ударопрочного ABS-пластика, удобный хват, не желтеет со временем. Совместима со всеми стандартными профилями ПВХ.",
    price: 449,
    img: "https://m.media-amazon.com/images/I/61objGe0d9L.jpg",
  },
  {
    name: "Ручка оконная SecureLock с ключом",
    description:
      "Оконная ручка с встроенным замком для защиты от детей и взлома. Металлический механизм, антивандальный корпус, в комплекте 2 ключа. Подходит для пластиковых и алюминиевых рам.",
    price: 1099,
    img: "https://eu.evocdn.io/dealer/1716/catalog/product/images/2_f_b_e_2fbe72bef864471710dc7c2b311939b8a95cee2f_essentials_multi_spindle_upvc_window_handle_white.jpg",
  },
  {
    name: "Ручка оконная DesignPro черная матовая",
    description:
      "Премиальная алюминиевая ручка с матовым покрытием. Минималистичный дизайн, мягкий ход, устойчивость к царапинам. Отлично вписывается в современные интерьеры.",
    price: 899,
    img: "https://www.thelockandhandle.com/wp-content/uploads/2019/01/susie-1a.jpg",
  },
];

export async function main() {
  await prisma.profile.createMany({
    data: profilesData,
  });
  await prisma.product.createMany({
    data: productsData,
  });
  await prisma.user.createMany({
    data: usersData,
  });
}

void main();
