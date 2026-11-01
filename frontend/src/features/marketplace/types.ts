export type Listing = {
    id: string;
    from: string;
    to: string;
    fromFlag: string;
    toFlag: string;
    cargo: string;
    weight: string;
    vehicle: string;
    price: string;
    application: string;
    date: string;
    source: string;
    urgent?: boolean;
    kind: "load" | "vehicle";
};
