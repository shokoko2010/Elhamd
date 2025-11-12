import { Prisma } from '@prisma/client'

const KNOWN_SCHEMA_ERROR_CODES = ['P2021', 'P2022', 'P2023', 'P2010']

export const isSchemaMissingError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return KNOWN_SCHEMA_ERROR_CODES.includes(error.code)
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    return (
      message.includes('does not exist') ||
      message.includes('no such table') ||
      message.includes('relation') && message.includes('not found')
    )
  }

  return false
}

export const shouldFallbackToEmptyResult = (error: unknown) => {
  if (isSchemaMissingError(error)) {
    return true
  }

  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  )
}
