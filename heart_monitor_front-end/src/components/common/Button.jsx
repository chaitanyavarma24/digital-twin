import { Button } from "@mui/material";

export default function CustomButton({ text, onClick }) {
  return (
    <Button
      variant="contained"
      fullWidth
      style={{ marginTop: "20px" }}
      onClick={onClick}
    >
      {text}
    </Button>
  );
}