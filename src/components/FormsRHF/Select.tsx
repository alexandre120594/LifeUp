import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@radix-ui/react-select";
import { Loader } from "lucide-react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";

export interface ISelectProps {
  options: {
    label: string;
    value: string;
  }[];
  title: string;
  placeholder: string;
  isLoading?: boolean;
  isRequired?: boolean;
  defaultValue?: string;
  onSelected?: (value: string) => void;
}

export function SelectRHF<FormType extends FieldValues>({
  options,
  title,
  control,
  rules,
  name,
  isLoading,
  placeholder,
  isRequired,
  defaultValue,
  onSelected,
  ...propsSelect
}: ISelectProps & UseControllerProps<FormType>) {
  return (
    <Controller
      control={control}
      rules={rules}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="flex flex-col space-y-3 w-full">
          {title ? (
            <label className="text-sm font-bold block mb-2">
              {title} {(!!rules?.required || isRequired) && "(*)"}
            </label>
          ) : null}
          <div>
            <Select
              onValueChange={(val: string) => {
                field.onChange(String(val));
                onSelected?.(String(val));
              }}
              value={defaultValue || field?.value}
            >
              <SelectTrigger
                {...propsSelect}
                className="h-11 flex items-center justify-between relative"
              >
                <SelectValue placeholder={placeholder} />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Loader className="h-5 w-5 animate-spin text-text-secondary" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent className="flex flex-wrap">
                {options?.length ? (
                  options?.map((item) => (
                    <SelectItem
                      key={item?.value}
                      value={String(item?.value)}
                      className={
                        typeof item?.label === "string" &&
                        item?.label?.includes("Inativo")
            ? "text-danger"
                          : ""
                      }
                    >
                      {item.label}
                    </SelectItem>
                  ))
                ) : isLoading ? (
                  <SelectItem value="0" disabled>
                    Carregando...
                  </SelectItem>
                ) : (
                  <SelectItem value="0" disabled>
                    Nenhum item encontrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {!!error?.message && (
      <p className="py-1 text-[12px] text-danger">{error?.message}</p>
            )}
          </div>
        </div>
      )}
    />
  );
}
