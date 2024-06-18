import {isEqual} from 'lodash';
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
      fieldErrors: Partial<Record<keyof FormInput, Array<string>>>;
    };

async function submitAction(
  prev: unknown,
  data: FormData
): Promise<FormResult> {
  'use server';

  const values = Object.fromEntries(data.entries());
  const t = await getTranslations('ZodFormExample');

  const result = FormSchema.safeParse(values, {
    errorMap(issue, ctx) {
      let message;
      if (isEqual(issue.path, ['task'])) {
        message = t('taskEmpty');
      }
      if (!message) {
        message = ctx.defaultError;
      }
      return {message};
    }
  });

  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors
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
        <label>
          <input name="task" placeholder={t('task')} type="text" />
        </label>
      </ZodForm>
    </section>
  );
}
