import axios from "axios"

const api = axios.create({
    baseURL: "https://viacep.com.br/ws",
    timeout: 1000 * 10,
})

const search = async (cep: string | NumberConstructor) => await api.get(`/${cep}/json/`)

export default { search }
