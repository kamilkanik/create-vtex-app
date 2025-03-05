import React from "react";

interface CustomComponentProps {
  title: string;
  subtitle: string;
}

export const CustomComponent = ({ title, subtitle }: CustomComponentProps) => {
  return (
    <>
      <p>{title}</p>
      <p>{subtitle}</p>
    </>
  );
};

CustomComponent.defaultProps = {
  title: "VTEX",
  subtitle: "The Composable and Complete Commerce Platform.",
};

CustomComponent.schema = {
  title: "Custom Component",
  type: "object",
  properties: {
    title: {
      type: "string",
      title: "Título",
    },
    subtitle: {
      type: "string",
      title: "Subtítulo",
    },
  },
};
