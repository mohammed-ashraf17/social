
type createParams = {
    model: any,
    data: any
}

export const create = ({ model, data }: createParams) => {
    return model.create(data)
}
export const find = ({ model, data }: createParams) => {
    return model.find(data)
}

export const findById = ({ model, data }: createParams) => {
    return model.findById(data)
}