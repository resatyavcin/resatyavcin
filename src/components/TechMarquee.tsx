const TECH = [
  { name: "Java", icon: "/icons/java.svg" },
  { name: "Spring Boot", icon: "/icons/spring.svg" },
  { name: "Maven", icon: "/icons/maven.svg" },
  { name: "PostgreSQL", icon: "/icons/postgresql.svg" },
  { name: "Redis", icon: "/icons/redis.svg" },
  { name: "Kafka", icon: "/icons/kafka.svg" },
  { name: "Docker", icon: "/icons/docker.svg" },
  { name: "Kubernetes", icon: "/icons/kubernetes.svg" },
  { name: "Git", icon: "/icons/git.svg" },
] as const;

function BadgeRow() {
  return TECH.map((item) => (
    <span className="tech-badge" key={item.name}>
      <img src={item.icon} alt="" width={20} height={20} draggable={false} />
      {item.name}
    </span>
  ));
}

export default function TechMarquee() {
  return (
    <div className="tech-marquee" aria-label="Teknolojiler">
      <div className="tech-marquee__track">
        <div className="tech-marquee__group">
          <BadgeRow />
        </div>
        <div className="tech-marquee__group" aria-hidden="true">
          <BadgeRow />
        </div>
      </div>
    </div>
  );
}
