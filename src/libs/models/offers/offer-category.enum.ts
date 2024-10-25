export enum Language {
    EN = "en",
    DE = "de",
    RU = "ru",
}

export const ServiceCategory = {
    PhotoVideoServices: {
        [Language.EN]: "Photo & Video Services",
        [Language.DE]: "Foto- und Videodienste",
        [Language.RU]: "Фото и Видео Услуги",
    },
    HomeServices: {
        [Language.EN]: "Home Services",
        [Language.DE]: "Hausdienste",
        [Language.RU]: "Услуги по Дому",
    },
    TourGuide: {
        [Language.EN]: "Tour Guide",
        [Language.DE]: "Reiseführer",
        [Language.RU]: "Гид",
    },
    Transfer: {
        [Language.EN]: "Transfer",
        [Language.DE]: "Transfer",
        [Language.RU]: "Трансфер",
    },
    AutoServices: {
        [Language.EN]: "Auto Services",
        [Language.DE]: "Autodienste",
        [Language.RU]: "Авто Сервис",
    },
    CoffeeShops: {
        [Language.EN]: "Coffee Shops",
        [Language.DE]: "Cafés",
        [Language.RU]: "Кофейни",
    },
    BeautyAndWellness: {
        [Language.EN]: "Beauty & Wellness",
        [Language.DE]: "Schönheit und Wellness",
        [Language.RU]: "Красота и Здоровье",
    },
    FitnessAndSports: {
        [Language.EN]: "Fitness & Sports",
        [Language.DE]: "Fitness und Sport",
        [Language.RU]: "Фитнес и Спорт",
    },
    EducationAndTutoring: {
        [Language.EN]: "Education & Tutoring",
        [Language.DE]: "Bildung und Nachhilfe",
        [Language.RU]: "Образование и Репетиторство",
    },
    EventPlanning: {
        [Language.EN]: "Event Planning",
        [Language.DE]: "Eventplanung",
        [Language.RU]: "Организация Мероприятий",
    },
    PetServices: {
        [Language.EN]: "Pet Services",
        [Language.DE]: "Haustierdienste",
        [Language.RU]: "Услуги для Животных",
    },
    MedicalServices: {
        [Language.EN]: "Medical Services",
        [Language.DE]: "Medizinische Dienste",
        [Language.RU]: "Медицинские Услуги",
    },
    LegalServices: {
        [Language.EN]: "Legal Services",
        [Language.DE]: "Rechtsdienste",
        [Language.RU]: "Юридические Услуги",
    },
    ITSupport: {
        [Language.EN]: "IT Support",
        [Language.DE]: "IT-Unterstützung",
        [Language.RU]: "IT Поддержка",
    },
    FinancialServices: {
        [Language.EN]: "Financial Services",
        [Language.DE]: "Finanzdienste",
        [Language.RU]: "Финансовые Услуги",
    },
    RealEstate: {
        [Language.EN]: "Real Estate",
        [Language.DE]: "Immobilien",
        [Language.RU]: "Недвижимость",
    },
} as const;

export type ServiceCategoryType = keyof typeof ServiceCategory;