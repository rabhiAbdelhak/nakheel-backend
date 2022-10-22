export class CreateLotDto {
    number: string
    minQuantity?: number
    maxPrice?: number
    minPrice?: number
    unitCost: number
    creatorId?: number
    updaterId?: number
    productId: number
    note?: string
    
}
