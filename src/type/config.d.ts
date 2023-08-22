export type menuComponentType = {
    label: string,
    show: boolean,
    img: string,
    route: string,
    component: () => Promise<typeof import("*.vue")>,
}

export type menuConfigType = {
    label: string,
    name: string,
    components: menuComponentType[],
}