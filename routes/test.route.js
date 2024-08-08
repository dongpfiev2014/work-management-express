import { Router } from "express";

const testRouter = Router();

testRouter.head("/", (req, res) => {
  res.status(200).json({ message: "Test route successfully hit!" });
});

export default testRouter;
