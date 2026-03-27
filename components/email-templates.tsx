import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// --- SHARED STYLES & VARS ---

const src = "";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "LuxeComm";

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const button = {
  backgroundColor: "#854AE7",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 20px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderBottom: "1px solid #cccccc",
};

const itemDetails = {
  flex: "1",
};

const itemPrice = {
  fontWeight: "bold" as const,
  textAlign: "right" as const,
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "16px",
  fontWeight: "bold" as const,
  fontSize: "18px",
};

const addressContainer = {
  marginTop: "24px",
  padding: "16px",
  border: "1px solid #cccccc",
  borderRadius: "5px",
};

// --- FORGOT PASSWORD CODE EMAIL ---

interface ForgotPasswordCodeEmailProps {
  code: string;
}

export const ForgotPasswordCodeEmail = ({
  code,
}: ForgotPasswordCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>Your {brandName} Password Reset Code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={src} width="60" height="60" alt={brandName} style={logo} />
        <Heading style={heading}>Your Password Reset Code</Heading>
        <Text style={paragraph}>
          We received a request to reset your password.
        </Text>
        <Text style={paragraph}>
          Enter the following verification code to reset your password. This
          code will expire in 15 minutes.
        </Text>
        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Text
            style={{
              ...paragraph,
              fontWeight: "bold",
              fontSize: "32px",
              letterSpacing: "8px",
              textAlign: "center" as const,
            }}
          >
            {code}
          </Text>
        </Section>
        <Text style={paragraph}>
          If you didn't request a password reset, you can safely ignore this
          email.
        </Text>
      </Container>
    </Body>
  </Html>
);

ForgotPasswordCodeEmail.PreviewProps = {
  code: "123456",
} as ForgotPasswordCodeEmailProps;

// --- ORDER CONFIRMATION EMAIL ---

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderConfirmationEmailProps {
  order: {
    _id: string;
    orderNumber: string;
    createdAt?: string | Date;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    total: number;
  };
  customerName: string;
}

export const OrderConfirmationEmail = ({
  order,
  customerName,
}: OrderConfirmationEmailProps) => {
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <Html>
      <Head />
      <Preview>
        Your {brandName} Order #{order.orderNumber} is confirmed
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={src} width="60" height="60" alt={brandName} style={logo} />
          <Heading style={heading}>Thanks for your order!</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            We've received your order and are getting it ready for shipment. You
            can view your order details below.
          </Text>

          <Hr style={hr} />

          <Section>
            <Text style={{ ...paragraph, fontWeight: "bold" }}>
              Order #{order.orderNumber} ({orderDate})
            </Text>
            {order.items.map((item, index) => (
              <div key={index} style={itemRow}>
                <div style={itemDetails}>
                  <Text style={{ margin: 0 }}>{item.name}</Text>
                  <Text style={{ ...footer, margin: 0 }}>
                    Qty: {item.quantity}
                  </Text>
                </div>
                <div style={itemPrice}>
                  <Text style={{ margin: 0 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={{ ...hr, borderStyle: "dashed" }} />

          <Section>
            <div style={totalRow}>
              <Text style={{ margin: 0 }}>Total</Text>
              <Text style={{ margin: 0 }}>${order.total.toFixed(2)}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={addressContainer}>
            <Text style={{ ...paragraph, fontWeight: "bold", margin: 0 }}>
              Shipping to:
            </Text>
            <Text style={{ ...paragraph, margin: "8px 0 0 0" }}>
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.street}
              {order.shippingAddress.apartment
                ? `, ${order.shippingAddress.apartment}`
                : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
              <br />
              {order.shippingAddress.country}
            </Text>
          </Section>

          <Section style={btnContainer}>
            <Button style={button} href={`${baseUrl}/orders/${order._id}`}>
              View Your Order
            </Button>
          </Section>

          <Text style={paragraph}>
            We'll notify you again once your order has shipped.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

OrderConfirmationEmail.PreviewProps = {
  customerName: "John Doe",
  order: {
    _id: "ord_12345",
    orderNumber: "LC-654321",
    createdAt: new Date().toISOString(),
    total: 129.98,
    shippingAddress: {
      fullName: "John Doe",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345",
      country: "USA",
    },
    items: [
      { name: "Classic T-Shirt", quantity: 2, price: 29.99 },
      { name: "Denim Jeans", quantity: 1, price: 70.0 },
    ],
  },
} as OrderConfirmationEmailProps;

// --- NEW ORDER NOTIFICATION EMAIL (FOR SELLER) ---

interface NewOrderNotificationEmailProps {
  order: {
    _id: string;
    orderNumber: string;
    createdAt?: string | Date;
    shippingAddress: ShippingAddress;
    items: OrderItem[];
    total: number;
  };
  customerName: string;
}

export const NewOrderNotificationEmail = ({
  order,
  customerName,
}: NewOrderNotificationEmailProps) => {
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <Html>
      <Head />
      <Preview>
        New Order #{order.orderNumber} from {customerName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={src} width="60" height="60" alt={brandName} style={logo} />
          <Heading style={heading}>You've Received a New Order!</Heading>
          <Text style={paragraph}>Hi Seller,</Text>
          <Text style={paragraph}>
            You have received a new order from {customerName}. The order details
            are below.
          </Text>

          <Hr style={hr} />

          <Section>
            <Text style={{ ...paragraph, fontWeight: "bold" }}>
              Order #{order.orderNumber} ({orderDate})
            </Text>
            {order.items.map((item, index) => (
              <div key={index} style={itemRow}>
                <div style={itemDetails}>
                  <Text style={{ margin: 0 }}>{item.name}</Text>
                  <Text style={{ ...footer, margin: 0 }}>
                    Qty: {item.quantity}
                  </Text>
                </div>
                <div style={itemPrice}>
                  <Text style={{ margin: 0 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </div>
              </div>
            ))}
          </Section>

          <Hr style={{ ...hr, borderStyle: "dashed" }} />

          <Section>
            <div style={totalRow}>
              <Text style={{ margin: 0 }}>Total</Text>
              <Text style={{ margin: 0 }}>${order.total.toFixed(2)}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={addressContainer}>
            <Text style={{ ...paragraph, fontWeight: "bold", margin: 0 }}>
              Shipping to:
            </Text>
            <Text style={{ ...paragraph, margin: "8px 0 0 0" }}>
              {order.shippingAddress.fullName || customerName}
              <br />
              {order.shippingAddress.street}
              {order.shippingAddress.apartment
                ? `, ${order.shippingAddress.apartment}`
                : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
              <br />
              {order.shippingAddress.country}
            </Text>
          </Section>

          <Section style={btnContainer}>
            <Button
              style={button}
              href={`${baseUrl}/admin/orders/${order._id}`}
            >
              View Order in Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

NewOrderNotificationEmail.PreviewProps = {
  ...OrderConfirmationEmail.PreviewProps,
} as NewOrderNotificationEmailProps;
