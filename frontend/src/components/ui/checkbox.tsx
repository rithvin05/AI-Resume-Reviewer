import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { grey } from "@mui/material/colors";

type Props = {
  checked: boolean;
  label?: string;
};

export default function Checkboxes({ checked }: Props) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          disabled
          sx={{
            color: grey[800],
            "&.Mui-checked": {
              color: grey[600],
            },
          }}
        />
      }
      label={""}
    />
  );
}
