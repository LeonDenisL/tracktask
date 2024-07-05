import React from "react";
import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Gestão de Tarefas</Link>
        </li>
        <li>
          <Link to="/completed">Tarefas Concluídas</Link>
        </li>
        <li className="navbar-right">
          <a
            href="https://www.linkedin.com/in/leondenislucena/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href="https://github.com/LeonDenisL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={20} />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
