// import type { Metadata } from "next";

// type Props = {
//     children: React.ReactNode;
//     params: Promise<{
//         slug: string;
//     }>;
// };

// export async function generateMetadata(
//     { params }: Props
// ): Promise<Metadata> {

//     const { slug } = await params;

//     try {
//         const res = await fetch(
//             "https://gafiwshop.xyz/api/api_product",
//             {
//                 cache: "no-store",
//             }
//         );

//         const data = await res.json();

//         const product = data.data?.find(
//             (p: any) => p.type_id === slug
//         );

//         return {
//             title: product?.name || "Product",
//         };

//     } catch {
//         return {
//             title: "Product",
//         };
//     }
// }

// export default function ProductLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return children;
// }

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "สินค้า",
    description: "สินค้า",
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}