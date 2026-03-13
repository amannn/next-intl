import {useTranslations} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {z} from 'zod';
import ZodForm from './ZodForm';

const FormSchema = z.object({
  task: z.string().min(1)
});

type FormInput = z.infer<typeof FormSchema>;

export type FormResult =
  | {
      success: true;
    }
  | {
      success: false;
      errors: {
        formErrors?: Array<string>;
        fieldErrors?: Partial<Record<keyof FormInput, Array<string>>>;
      };
    };

async function submitAction(
  prev: unknown,
  data: FormData
): Promise<FormResult> {
  'use server';

  const values = Object.fromEntries(data.entries());
  const t = await getTranslations('ZodFormExample');

  const result = FormSchema.safeParse(values, {
    error(issue) {
      if (issue.path && issue.path.join('.') === 'task') {
        return t('taskEmpty');
      }
    }
  });

  if (!result.success) {
    return {
      success: false,
      errors: z.flattenError(result.error)
    };
  } else {
    return {
      success: true
    };
  }
}

export default function ZodFormExample() {
  const t = useTranslations('ZodFormExample');

  return (
    <section>
      <h2>Zod form</h2>
      <ZodForm action={submitAction}>
        <input name="task" placeholder={t('task')} type="text" />
      </ZodForm>
    </section>
  );
}
