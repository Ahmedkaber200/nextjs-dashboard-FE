"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import postgres from "postgres";

import { signIn } from '../ui/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// Check if POSTGRES_URL is defined
if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not defined.");
}

// Create a PostgreSQL connection
const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

// // Define the schema for invoice creation
// const CreateInvoice = z.object({
//   customerId: z.string(),
//   amount: z.number(),
//   status: z.enum(["pending", "paid"]), // Assuming status can be 'pending' or 'paid'
// });

// Define the schema for invoice creation and updatez
const CreateInvoice = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
  .number()
  .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
}),
date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    id: crypto.randomUUID(), // Generate a random ID if needed
    customerId: formData.get('customerId'),
    amount: Number(formData.get("amount")),
    status: formData.get('status'),
    date: new Date().toISOString().split("T")[0], // Add current date
  });

  // If form validation fails, return errors early
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion
  const { customerId, amount, status, date } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    console.log('Invoice created successfully');
    
    revalidatePath('/ui/dashboard/invoices');
    return redirect('/ui/dashboard/invoices');
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
}

  export async function deleteInvoice(id: string) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath("/dashboard/invoices");
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      throw new Error('Failed to Delete Invoice');
    }
  }

// export async function deleteInvoice(id: string) {
//   throw new Error('Failed to Delete Invoice');
  
//    // Unreachable code block
//   await sql`DELETE FROM invoices WHERE id = ${id}`;
//   revalidatePath("/dashboard/invoices");
// }

// Define the schema for invoice creation and updatez
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
  .number()
  .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
}),
date: z.string(),
});

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: Number(formData.get("amount")), // Convert string to number
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

  redirect("/ui/dashboard/invoices");
}

