export default function Loading(){
    return (
        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
        <div className="bg-card px-6 py-3 border-brutal border-border font-black rounded-lg">Processing...</div>
      </div>
    );
}