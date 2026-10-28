export const sampleMessages = [
  {
    id: "delivery",
    label: "Delivery update",
    channel: "SMS",
    content: "Your parcel is waiting. Confirm your delivery details at delivery-check.example.",
  },
  {
    id: "school",
    label: "School account",
    channel: "Email",
    content: "Your student account needs an urgent security check before today's deadline.",
  },
  {
    id: "reward",
    label: "Prize notification",
    channel: "Chat",
    content: "You have been selected for a reward! Send your details to claim it now.",
  },
] as const;
