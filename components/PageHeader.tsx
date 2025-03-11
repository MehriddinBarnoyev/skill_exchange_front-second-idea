interface PageHeaderProps {
    title: string
    description?: string
  }
  
  export function PageHeader({ title, description }: PageHeaderProps) {
    return (
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">{title}</h1>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
    )
  }
  
  