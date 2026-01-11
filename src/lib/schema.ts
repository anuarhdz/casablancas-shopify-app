import * as v from "valibot"

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty("Email is required"), v.email("Invalid email")),
  password: v.pipe(
    v.string(),
    v.nonEmpty("Password is required"),
    v.minLength(8, "Password must be at least 8 characters")
  ),
})

export const RegisterSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty("Name is required")),
    email: v.pipe(v.string(), v.nonEmpty("Email is required"), v.email("Invalid email")),
    password: v.pipe(
      v.string(),
      v.nonEmpty("Password is required"),
      v.minLength(8, "Password must be at least 8 characters")
    ),
    confirmPassword: v.pipe(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      (input) => input.password === input.confirmPassword,
      "Passwords do not match."
    ),
    ["confirmPassword"]
  )
)
