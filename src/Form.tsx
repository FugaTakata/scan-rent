import { Box, Button, Flex, Textarea, rem } from "@mantine/core";
import { UseFormReturnType, useForm } from "@mantine/form";
import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";

const suumoPlaceholder = `物件名などなどなどなど
https://suumo.jp/chintai/bc_xxxxxxxxxxxx/
by SUUMO
`;

const suumoUrlRegexPattern = /https:\/\/suumo\.jp\/chintai\/bc_\d+\//g;

export function FormContainer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    initialValues: {
      suumoText: "",
    },
  });

  const onSubmit = form.onSubmit(async (values) => {
    setIsSubmitting(true);

    const suumoUrl = values.suumoText.match(suumoUrlRegexPattern)?.[0];
    if (suumoUrl === undefined) {
      notifications.show({
        title: "エラーが発生しました🚨",
        message: "入力に誤りがあります。",
        color: "red",
      });
      setIsSubmitting(false);

      return;
    }
    const notificationId = notifications.show({
      loading: true,
      message: "物件情報を取得中です。",
      autoClose: false,
    });

    const scrapeSuumo = httpsCallable(functions, "scrapeSuumo");
    await scrapeSuumo({ targetUrl: suumoUrl });

    notifications.update({
      id: notificationId,
      color: "teal",
      icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      title: "物件情報の取得が完了しました🎉",
      message: values.suumoText.replace("by SUUMO", ""),
      loading: false,
      autoClose: 4000,
    });

    form.reset();
    setIsSubmitting(false);
  });

  return (
    <FormPresenter
      handleSubmit={onSubmit}
      form={form}
      isSubmitting={isSubmitting}
    />
  );
}

function FormPresenter({
  handleSubmit,
  form,
  isSubmitting,
}: {
  handleSubmit: (event?: React.FormEvent<HTMLFormElement> | undefined) => void;
  form: UseFormReturnType<
    {
      suumoText: string;
    },
    (values: { suumoText: string }) => {
      suumoText: string;
    }
  >;
  isSubmitting: boolean;
}) {
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Textarea
          rows={3}
          label="SUUMOの賃貸物件情報のページURLを含むテキストを入力"
          placeholder={suumoPlaceholder}
          {...form.getInputProps("suumoText")}
        />
        <Flex justify={"flex-end"}>
          <Button
            type={"submit"}
            radius={"sm"}
            size={"sm"}
            mt={8}
            disabled={!form.values.suumoText}
            loading={isSubmitting}
          >
            追加
          </Button>
        </Flex>
      </form>
    </Box>
  );
}
