using System.Net;

namespace LastApple.Web.Exceptions;

public class NotFoundException(string message = "The requested resource was not found.") 
    : HttpException(message, HttpStatusCode.NotFound)
{
}