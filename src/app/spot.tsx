import { Typography } from "@mui/joy";

export function CircleText({ text }: { text: string }) {
    return (
        <span
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: '3px solid #B34B4B',
                color: "#FE849F",
                margin: '5px',
                fontSize: '1.5rem',
                aspectRatio: 1
            }}
            className="mobile-40px"
        >
            {text}
        </span>
    );
}

export function Check({style}: {style: React.CSSProperties}) {
    return (
        <svg style={style} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
    )
}

export default function Section({ children, title, number, smalltext, bordered=false }: { children: React.ReactNode, title: string, number: string, smalltext: string, bordered?:boolean }) {
    return (
        <section style={{ display: "flex", width: '100%', flexDirection: 'column', borderTop:`${bordered?'1px solid #404144':'none'}`, borderBottom:`${bordered?'1px solid #404144':'none'}`, padding:`${bordered?'1.8rem 0px':'none'}` }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ width: '15%', display: 'flex', justifyContent: 'center' }}>
                    <CircleText text={number} />
                </div>
                <div style={{ width: '85%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography level="h4" style={{ marginBottom: '0' }} fontFamily={"Gotham Bold"}>{title}</Typography>
                        <Typography style={{ fontSize: '14px', marginLeft: '10px' }}>{smalltext}</Typography>
                    </div>
                </div>
            </div>
            <div style={{marginLeft: '15%'}}>
                {children}
            </div>
        </section>
    );
}