import { TextField } from "@mui/material";

export default function InputField({ label, type = "text", onChange }) {
  return (
    <TextField
      label={label}
      type={type}
      fullWidth
      margin="normal"
      onChange={onChange}
    />
  );
}