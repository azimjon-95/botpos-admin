# BOT·POS Admin Panel

To'liq boshqaruv paneli — do'konlar CRUD, xodimlar, mijozlar, OpenAI xarajat.

## O'rnatish
```bash
npm install
cp .env.example .env
npm start   # localhost:3001
```

## Sahifalar

| Sahifa | Yo'l | Tavsif |
|--------|------|--------|
| Dashboard | `/` | Statistika + bot holatlari (15s auto-yangilanish) |
| Do'konlar | `/shops` | CRUD: yaratish, tahrirlash, o'chirish, bloklash, restart |
| Do'kon forma | `/shops/new` `/shops/:id/edit` | Token shifrlash bilan |
| Xodimlar | `/shops/:id/workers` | Do'kon xodimlari CRUD + blok |
| Mijozlar | `/shops/:id/customers` | Cashback mijozlar + blok |
| OpenAI xarajat | `/openai` | Real API → kunlik grafik + model breakdown |
| Audit Log | `/audit` | Barcha admin amallari tarixi |

## API ulanish
`REACT_APP_API_BASE=http://localhost:6060` → `/api/admin/*`
